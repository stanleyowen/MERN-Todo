import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { labels, validateLabel } from '../libraries/validation';
import { setNotification, NOTIFICATION_TYPES } from '../libraries/setNotification';
import axios from 'axios';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Edit = () => {
    const email = localStorage.getItem('__email');
    const token = localStorage.getItem('__token');
    const userId = localStorage.getItem('__id');
    const {id} = useParams();
    const [title, setTitle] = useState('loading ...');
    const [date, setDate] = useState('2020-01-01');
    const [description, setDescription] = useState('loading ...');
    const [defaultValue, setDefaultValue] = useState('loading ...');
    const [label, setLabel] = useState(labels[0].toLowerCase());

    useEffect(() => {
        const getData = { email, id: userId }
        axios.get(`${SERVER_URL}/data/todo/getData/${id}`, { params: getData, headers: { Authorization: `JWT ${token}` } })
        .then(res => {
            setTitle(res.data.title);
            setDate(formatDate(res.data.date));
            if(res.data.description) setDescription(res.data.description);
            else setDescription('')
            setLabel(res.data.label);
            setDefaultValue(res.data);
        })
        .catch(err => {
            setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            setTimeout(() => { window.location='/' }, 2000)
        });
        document.querySelectorAll('[data-autoresize]').forEach(function (e) {
            e.style.boxSizing = 'border-box';
            var offset = e.offsetHeight - e.clientHeight;
            e.addEventListener('input', function (a) {
              a.target.style.height = '-10px';
              a.target.style.height = a.target.scrollHeight + offset + 'px';
            });
            e.removeAttribute('data-autoresize');
        });
    }, [id, email, token, userId])

    const formatDate = (a) => {
        var e = new Date((a.substring(10, 0)) * 1000);
        var date = parseInt(e.getDate());
        var month = parseInt(e.getMonth() + 1);
        var year = e.getFullYear();
        if(date < 10) date = '0'+date;
        if(month < 10) month = '0'+month;
        return year+'-'+month+'-'+date;
    }

    const updateData = (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-addTodo');
        async function submitData() {
            btn.innerHTML = "Updating";
            const postData = { email, objId: id, id: userId, title, label, description, date }
            await axios.post(`${SERVER_URL}/data/todo/update/`, postData, { headers: { Authorization: `JWT ${token}` } })
            .then(() => window.location='/')
            .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Update";
        }
        if(!email || !token || !userId || EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.") }
        else if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !") }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !") }
        else if(validateLabel(label)) setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Label")
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !") }
        else if(date.length !== 10 || DATE_VAL.test(String(date)) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Date !") }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }        
    }
    return (
        <div>
            { title && label && defaultValue === "loading ..." ?
            (<div className="loader"><div className="spin-container full-width">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div></div>) : null }
            <div className="main__projects">
                <a href="/" className="close"><i className="fas fa-times" style={{'fontSize': '30px'}}></i></a>
                <form onSubmit={updateData} className="mt-20">
                    <div className="form__container">
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="title">Title <span className="required">*</span></label>
                                <input title="Title" id="title" type="text" className="contact__inputField" onChange={(event) => setTitle(event.target.value)} value={title} required autoComplete="off" />
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                        <div className="contact__formControl">
                            <div className="contact__infoField">
                                <label htmlFor="label">Date <span className="required">*</span></label>
                                <input type="date" className="contact__inputField datepicker" onChange={(event) => setDate(event.target.value)} value={date} required></input>
                                <span className="contact__onFocus"></span>
                            </div>
                        </div>
                    </div>

                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="label">Label <span className="required">*</span></label>
                            <select onChange={(event) => setLabel(event.target.value)} value={label}>
                                { labels.map(c => {
                                    return (<option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)
                                }) }
                            </select>
                        </div>
                    </div>

                    <div className="contact__formControl">
                        <div className="contact__infoField">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" className="contact__inputField" data-autoresize rows="2" onChange={(event) => setDescription(event.target.value)} value={description}></textarea>
                            <span className="contact__onFocus"></span>
                        </div>
                    </div>
                    { defaultValue.title === title && formatDate(defaultValue.date.substring(10, 0)) === date && defaultValue.description === description && defaultValue.label === label ? (<button type="disabled" id="btn-addTodo" className="btn__outline disabled" disabled={true} style={{outline: 'none'}}>Update</button>) : (<button type="submit" id="btn-addTodo" className="btn__outline" style={{outline: 'none'}}>Update</button>)}
                </form>
            </div>
        </div>
    )
}

export default Edit;