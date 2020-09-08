import * as cors from 'cors'
import * as express from 'express'
import * as helmet from 'helmet'
import * as http from 'http'

import * as fs from 'fs'
import * as puppeteer from 'puppeteer'


import { getLogger, logHandler } from './utils'

export class Server {
  private app: express.Application
  private server: http.Server
  private port: string | number
  private log: any

  constructor() {
    this.port = process.env.PORT || 5000
    this.log = getLogger(__dirname, __filename)
    this.app = express()

    this.app
      .use(helmet())
      .use(cors())
      .use(express.json())
      .use(express.urlencoded({ extended: false }))
      .use(logHandler)
  }

  /**
   * processing here
   */
  private readFile = (src: string) => {
    return new Promise((resolve, reject) => {
      fs.readFile(src, "utf8", (err, data) => {
        if (err) {
          reject()
        }
        resolve(data)
      })
    })
  }

  private readFolder = (src: string) => {
    return new Promise((resolve, reject) => {
      fs.readdir(src, (err, files) => {
        if (err) { 
          reject()
        }
        resolve(files)
      })
    })
  }

  private writeBase64Image = (img: string, dest: string) => {
    return new Promise((resolve, reject) => {
      const data = img.replace(/^data:image\/\w+;base64,/, "");    
      const buf = new Buffer(data, 'base64');
      fs.writeFile(dest, buf, 'binary', (err) => {
        if (err) {
          reject()
        }
        resolve()
      });
    })
  }

  private doRequest = (options: any) => {
    return new Promise ((resolve, reject) => {
      let req = http.request(options);
      console.log(options)

      req.on('response', res => {
        resolve(res);
      });

      req.on('error', err => {
        reject(err);
      });
    }); 
  }

  private async processAds() {
    const resourcesDir = `${__dirname}/resources/`
    try {
      const files: any = await this.readFolder(resourcesDir)

      files.forEach(async (filename: string) => {
        const file: any = await this.readFile(`${resourcesDir}${filename}`)
        const tagRegex = /\<img.+src\=(?:\"|\')(.+?)(?:\"|\')(?:.+?)\>/
        const [ imageTag ] = file.match(tagRegex)
        if (imageTag) {
          const srcRegex = /src="([^"]+)"/
          const [ srcAttr ] = imageTag.match(srcRegex)
          if (srcAttr) {
            const src = srcAttr.substr(5, srcAttr.length - 6)

            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.goto(src)
            await page.waitForSelector('img');          // wait for the selector to load
            const element = await page.$('img');        // declare a variable with an ElementHandle
            if (element) {
              await element.screenshot({path: `${resourcesDir}${filename}.png`}); // take screenshot element in puppeteer
            }
            await browser.close();
          }
        }

        // await this.writeBase64Image(img, `${resourcesDir}1.png`)
        // await this.writeBase64Image(img1, `${resourcesDir}image.png`)
      })

    } catch (err) {
      console.log(err)
    }

  }

  public async start() {
    return new Promise(async (resolve, reject) => {
      try {

        await this.processAds()

        this.server = http.createServer(this.app)

        this.server.listen(this.port, () => {
          this.log.info(`Server listening on http://localhost:${this.port}`)
          return resolve(true)
        })
      } catch (error) {
        this.log.error(error.message)
        return reject(error)
      }
    })
  }

  public stop() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.server) return resolve('No server is running.')

        this.server.close()

        this.server.on('close', () => {
          return resolve(true)
        })
      } catch (error) {
        return reject(error)
      }
    })
  }

}

const server = new Server()
export default server