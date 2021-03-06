const axios = require('axios');
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const getUserToken = async (token, id) => {
    if(token && id){
        let _userInfo = null;
        await axios.get(`${SERVER_URL}/data/accounts/getUserByToken`, {params: {id, token}, headers: { Authorization: `JWT ${token}` }})
        .then(res => _userInfo = res.data)
        .catch(() => _userInfo = null)
        return _userInfo;
    }else return undefined;
}

export default getUserToken;