const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const list_id = "17da740625"
require('dotenv').config();

mailchimp.setConfig({
    apiKey: process.env.API_KEY,
    server: "us6",
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req,res) => {
    res.sendFile(`${__dirname}/signup.html`);
})

app.post("/", async (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    let response = await mailchimp.lists.addListMember(list_id, {
        email_address: email,
        status: "subscribed",
        merge_fields: {
            FNAME: firstName,
            LNAME: lastName
        }
    }, {
        skipMergeValidation: true
    })
        .then(() => {
            res.sendFile(`${__dirname}/success.html`)
        })
        .catch(error => {
            let errorData = JSON.parse(error.response.text);
            console.log(errorData.detail);
            res.sendFile(`${__dirname}/failure.html`)
        });
});

app.post("/failure.html", async(req,res) => {
    res.redirect("/");
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
})