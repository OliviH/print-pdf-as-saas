const express = require('express')

const { deleteFile, pdf } = require('./controller/printPdf')

const path = require('path')

const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.json({
        message: 'welcome to SASS PDF',
        date: new Date().toISOString()
    })
})

app.post('/', (req,res) => {
    const { html, options, multiple} = req.body
    if(!html) return res.send({
        message: 'error',
        date: new Date().toISOString(),
        error:"BAD REQUEST"
    })
    pdf(html, options, multiple)
    .then(resp=>{
        console.log(resp)
        res.download(resp.options.path, path.basename(resp.options.path), err=> {
            if(err) {
                console.error('error to send file', resp.options.path)
                console.error(err)
            } else {
                console.log('file transmit ok,', resp.options.path)
            }
            deleteFile(resp.path)
        })
    })
    .catch(err=>{
        console.error(err)
        return res.send({
            message: 'error',
            date: new Date().toISOString(),
            error:err
        })
    })
})

app.listen(PORT,()=> {
    console.log(`server SAAS PDF running on port ${PORT}`)
})
