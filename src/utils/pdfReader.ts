import { DATE_REGEX, VALUE_REGEX } from '@/enums'
import pdfParse from 'pdf-parse'

export async function readPDF(buffer:Buffer<ArrayBufferLike>) {
    const date = await pdfParse(buffer) // Read File based on buffer created by the NodeJs  Readable stream
    const lines = date.text.split('\n') 

    const transactions = []


    for (const line of lines) {
        const hasDate = DATE_REGEX.test(line) // Search for transaction date
        const hasValue = VALUE_REGEX.test(line)// Search for transaction value

        if (!hasDate || !hasValue) continue

        // Check What lines from the PDF has transactions by looking to the date and value
        const dateString = DATE_REGEX.exec(line)?.[0] 
        const valueString = VALUE_REGEX.exec(line)?.[0]

        if(dateString && valueString) {
            // Format data to return Transaction
            const [day, month, year] = dateString.split('/')
            const date = new Date(`${year}-${month}-${day}`)
        
            const value = parseFloat(valueString.replace(/\./g, '').replace(',', '.'))
            const type: 'EXPENSE' | 'INCOME' = value < 0 ? 'EXPENSE' : 'INCOME'
        
            const description = line
            .replace(dateString, '')
            .replace(valueString, '')
            .trim()
        
            if (/SALDO DO DIA/i.test(description)) continue
        
            transactions.push({
            date,
            description,
            amount: Math.abs(value),
            type
            })
        }
    }

    return transactions
}
