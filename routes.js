const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;
    if (url === "/") {
        res.write('<html>');
        res.write('<head><title>Enter Message</title></head>');
        res.write('<body>' +
        '<form action="/message" method="POST">' + 
        '<input type="text" name="message">' + 
        '<button type="submit">Submit</button>' + 
        '</body>');
        return res.end();
    }
    if (url === "/message" && method === "POST") {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        req.on('end', () => {
        const parsedBody = Buffer.concat(body).toString();
        const message = parsedBody.split('=')[1];
        console.log(message);
        fs.writeFile('message.txt', message, (err) => {
            if (err) return console.error(err);
            });
        res.statusCode = 302;
        res.setHeader('location', '/');
        return res.end();
        });
    }
}

module.exports = requestHandler;