const puppeteer = require("puppeteer")
const fs = require('fs-extra')
const path = require('path')
const crypto = require('crypto')

let timeOuts = []

const timer_persist = process.env.TIME_PERSIST? process.env.TIME_PERSIST*1000 : 10000

const seeTimer = () => {
  let now = Date.now()
  let tmp_timeOuts = [...timeOuts]
  tmp_timeOuts.forEach(opt=> {
    if (now > opt._startedTimeOut + timer_persist) {
      console.log("=> ACTION DELETE FILE AUTO",opt.path,  new Date().toLocaleString())
      timeOuts = timeOuts.filter(t=>t._idTimeOut !== opt._idTimeOut)
      deleteFile(opt.path)
    }
  })
}
setInterval(seeTimer, 1000)

const deleteFile = (file) => {
    fs.pathExists(file)
    .then(exists=> {
      if(exists)
        fs.unlink(file, (err) => {
            if (err) return ;
            console.log('\t->> File deleted:', file)
        })
    })
    .catch(err=>console.error(err))
}

const permission = 0o640 // for debuging0o777

const pdf = (
  html = "<html><body><h1>" + new Date().toISOString() + "</h1></body></html>",
  options = { format: "a4" },
  multiple = false
) => {
  return new Promise(async(acc, rej) => {
    let pages = []

    if (!options.path)
        options.path = '../../../var/lib/drive/'+Date.now() + "_" + new Date().toISOString() + '.pdf';
    else options.path = path.resolve("/var/lib/drive/" , options.path + '.pdf');
    console.log(options.path)
    options.path = options.path.replace(/\.\.\//g, '/')
    options.path = options.path.replace(/\.\//g, '/')
    options.path = path.resolve(options.path)
    console.log(options.path)
    fs.ensureDirSync(path.dirname(options.path))
    if (multiple) {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
              "--disable-gpu",
              "--disable-dev-shm-usage",
              "--disable-setuid-sandbox",
              "--no-sandbox",
          ]
      });
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf(options);

        await browser.close();
        acc({message: 'Ok'})
      }
      catch(error) {
        console.error(error)
        rej({error})
      }
    } else {
      try {
        const browser = await puppeteer.launch({
          headless: true,
          args: [
              "--disable-gpu",
              "--disable-dev-shm-usage",
              "--disable-setuid-sandbox",
              "--no-sandbox",
          ]
      });
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf(options);

        await browser.close();
        fs.chmod(options.path, permission, err=> {
            if(err) throw err
            acc({message: 'Ok', options})
        })
        options._startedTimeOut = Date.now()
        options._idTimeOut = crypto.randomBytes(64).toString("hex")
        timeOuts.push(options)
      }
      catch(error) {
        console.error(error)
        rej({error})
      }
    }
  });
};
/** TEST */
pdf()


module.exports = { pdf, deleteFile };
