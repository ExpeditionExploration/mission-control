import express from 'express';
const app = express();
const port = 8080;
const websocketPort = 8081;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})