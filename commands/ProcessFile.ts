import { BaseCommand } from '@adonisjs/core/build/standalone'
import xlsx from 'xlsx'
import File from '../app/Models/File'
import Client from '../app/Models/Client'
import Bank from '../app/Models/Bank'
import Address from '../app/Models/Address'

export default class ProcessFile extends BaseCommand {
  public static commandName = 'process:file'

  public static description = 'process excel file into database'

  public static settings = {
    loadApp: true,
  }

  public async run() {
    const { default: FileModel } = await import('App/Models/File')
    const files = await FileModel.query().orderBy('id').limit(1)
    this.processFile(files)
  }

  public async processFile(files: File[]) {
  
    for (const file of files) {
      const workbook = xlsx.readFile(file.filePath)
  
      // Process and store data from sheet 1 (Client information)
      const clientSheet = workbook.Sheets['Sheet1']
      const clients = xlsx.utils.sheet_to_json(clientSheet)
  
      for (const clientData of clients) {
       
        // create new client into database


        const client = await Client.create({
          name: clientData.name,
          email: clientData.email,
          phoneNumber: clientData.phoneNumber,
          pan: clientData.pan,
        })



      // Process and store data from sheet 2 (Client Bank Details)

      const bankDetailsSheet = workbook.Sheets['Sheet2']
      const bankDetails = xlsx.utils.sheet_to_json(bankDetailsSheet)

      for (const bankDetailData of bankDetails) {
       
        await Bank.create({

          clientId: client.id,
          bankName: bankDetailData.bankName,
          accountHolderName: bankDetailData.accountHolderName,
          accountNumber: bankDetailData.accountNumber,
          ifscCode: bankDetailData.ifscCode,
          
        })
      }

        // Process and store data from sheet 3 (Client Address)

        const addressSheet = workbook.Sheets['Sheet3']
        const addresses = xlsx.utils.sheet_to_json(addressSheet)
  
        for (const addressData of addresses) {
         
          await Address.create({
            clientId: client.id,
            addressLine1: addressData.addressLine1,
            addressLine2: addressData.addressLine2,
            city: addressData.city,
            state: addressData.state,
            zip: addressData.zip,
          })
        }
      }
  



    this.logger.info(JSON.stringify(files, null, 2))
  }
}
