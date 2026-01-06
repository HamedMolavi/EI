const axios = require('axios');



url = 'http://localhost:3000/json/Setting';

async function main() {
  await axios.post(url, {
    "Hosts": [
      {
        "id": "Host-2",
        "ip": "172.16.215.251",
        "cpu": 4000,
        "mem": 4000,
        "net": 1000000
      },
      {
        "id": "Host-3",
        "ip": "172.16.215.252",
        "cpu": 4000,
        "mem": 4000,
        "net": 1000000
      }
    ]
  })
    .then((res) => {
      console.log(res.data.Message);
    })
    .catch((err) => {
      console.log(err);
    });

  await axios.delete(url, {
    "Hosts": [{ "id": "Host-2" }, { "id": "Host-4" }]
  })
    .then((res) => {
      console.log(res.data.Message);
    })
    .catch((err) => {
      console.log(err);
    })
  process.exit(0);
}
main();

