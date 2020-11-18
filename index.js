const cors = require('cors');
const { port, route, client_id, client_secret } = require('./settings.json');
const axios = require('axios').default;
const bodyParser = require('body-parser');
const { default: Axios } = require('axios');
const qs = require('querystring');
const _ = require('lodash');
const app = require('express')();

app.use(cors());
app.use(bodyParser.json());


app.post(`${route}/token`, (req, res) => {
    if (!req.body || !req.body.code || !req.body.redirect_uri) {
        return res.json({
            status: 400,
            message: 'code and/or redirect_uri missing'
        })
    }

    axios.post('https://accounts.spotify.com/api/token', qs.stringify({
        grant_type: 'authorization_code',
        code: req.body.code,
        redirect_uri: req.body.redirect_uri,
        client_id,
        client_secret
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        if (response.status === 200) {
            res.json(Object.assign({
                status: 200,
                message: 'ok',
            }, response.data));
        } else {
            res.json(Object.assign({
                status: 400,
                message: 'bad request'
            }, response.data));
        }
    })
    .catch(reason => {
        console.log(reason);
        res.json({
            status: 500,
            message: 'request failed',
            err: reason.response.data || undefined
        });
    })
})

app.post(`${route}/refresh`, (req, res) => {
    if (!req.body || !req.body.refresh_token) {
        return res.json({
            status: 400,
            message: 'refresh_token missing'
        })
    }

    refresh(req.body.refresh_token)
        .then(data => res.json(Object.assign({
            status: 200,
            message: 'ok'
        }, data)))
        .catch(data => res.json(Object.assign({
            status: 500,
            message: 'server error'
        }, data)));
})

function refresh(refresh_token) {
    return new Promise((res, rej) => {
        Axios.post(`https://accounts.spotify.com/api/token`, qs.stringify({
            grant_type: 'refresh_token',
            refresh_token,
            client_id,
            client_secret
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => {
            res(response.data);
        })
        .catch(reason => {
            rej(reason.data);
        })
    })

}

app.listen(port || 3000, () => console.log(`Listening on http://localhost:${port || 3000}`));