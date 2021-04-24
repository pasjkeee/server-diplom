const {User, Subject, Teacher} = require('../models/todo');
const {Router, response} = require('express');
const router = Router();
const bcrypt = require ('bcrypt-nodejs');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

const sequelize = require('../utils/database');
const { QueryTypes } = require('sequelize');


router.post('/login',
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        // check('password', 'Введите пароль').exists()
    ], 
    async (req, res) => {
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array(), message: 'Некорректные данные при входе в систему lol'})
        }

        const {email, pas} = req.body;

        const data = await User.findOne({where: { email: email }});
        
        if(!data){
            return res.status(400).json({message: "Пользователь не найден"})
        }
                
        await bcrypt.compare(pas, data.dataValues.password, function(err, result) {
                 
            if(!result){
                return res.status(400).json({message: "Неверный пароль, попробуйте снова"})
            }

            const token = jwt.sign({userId: data.user_id, authenticated: true, access_lvl: data.access_lvl}, "pavel", { expiresIn: '7d' });
            
            req.session.data = token;
                
            res.json({authenticated: true, userId: data.user_id, access_lvl: data.access_lvl});
        });
    } 
    catch (e) {
        res.status(500).json({message: 'ЧТо-то пошло не так, попробуйте снова'})
    }
});

router.get('/getAuthenticated', 
async (req, res) => {
    try {
        let token;
        const cookiesStr = `${req.cookies.session_cookie_name}`.slice(2, 12);
        const dataCookies = await sequelize.query(`SELECT data FROM sessions WHERE session_id LIKE '${cookiesStr}%'`, { type: QueryTypes.SELECT });
        if(dataCookies.length === 0){
            const result = {
                authenticated: false
            }
            res.json(result);
        }
        for (let key of dataCookies){
            let k = key['data'];
            token = k.split('"data":"')[1].slice(0, -2);
        }
        const decoded = jwt.decode(token, "pavel");
        const result = {
            authenticated: decoded.authenticated
        }
        res.json(result);
    }
    catch(e){
        res.status(500).json({message: 'Чnо-то пошло не так при обращении к серверу, попробуйте снова'});
    }
});




router.get('/subjects', 
async (req, res) => {
        try {
            let token;
            const cookiesStr = `${req.cookies.session_cookie_name}`.slice(2, 12);
            const dataCookies = await sequelize.query(`SELECT data FROM sessions WHERE session_id LIKE '${cookiesStr}%'`, { type: QueryTypes.SELECT });
            for (let key of dataCookies){
                let k = key['data'];
                token = k.split('"data":"')[1].slice(0, -2);
            }
            let decoded = jwt.decode(token, "pavel");

            const {access_lvl, userId, authenticated} = decoded;
            console.log(access_lvl, userId, authenticated);

            if(!authenticated){
                res.status(401);
            }
            
            if(access_lvl === 1){
                let resData = {};

                resData.teachers = [];

                let dataTeachers = await sequelize.query(`SELECT teacher_id, first_name, last_name, patronymic FROM teachers`, { type: QueryTypes.SELECT });

                resData.teachers = [...dataTeachers];

                resData.subjects = [];

                let dataSubjects = await sequelize.query(`SELECT subjects.subject, subjects.subject_id, teachers.teacher_id, teachers.first_name, teachers.last_name, teachers.patronymic FROM subjects JOIN teachers ON subjects.subject_id = teachers.subject_id`, { type: QueryTypes.SELECT }); 
                
                let newDataSubjects = [];
                let iter = -1;
                let setSubkectName = new Set();
                dataSubjects.forEach(item => {
                    if(!setSubkectName.has(item.subject)){
                        iter++;
                        setSubkectName.add(item.subject);
                        let newItem = {...item};
                        newItem.teacher_id = [item.teacher_id];
                        newItem.teachers = `${item.first_name} ${item.last_name[0]}.${item.patronymic[0]}.`
                        newDataSubjects[iter] = newItem;
                    } else {
                        let newItem = {...newDataSubjects[iter]};
                        newItem.teacher_id.push(item.teacher_id);
                        newItem.teachers = newItem.teachers+`, ${item.first_name} ${item.last_name[0]}.${item.patronymic[0]}.`
                        newDataSubjects[iter] = newItem;
                    }
                });

                resData.subjects = [...newDataSubjects];
                
                let dataTask = await sequelize.query(`SELECT tasks.task_id, tasks.task, tasks.task_type_id, tasks.theme_id, tasks.date, tasks.end_date, tasks.description, tasks.link, themes.theme, subjects.subject, task_types.task_type FROM tasks JOIN subjects JOIN themes JOIN task_types ON tasks.subject_id = subjects.subject_id AND tasks.theme_id = themes.theme_id AND tasks.task_type_id = task_types.task_type_id`, { type: QueryTypes.SELECT });

                let newDataTask = dataTask.map(item => {
                    let newItem = {...item};
                    newItem.date = newItem.date.toLocaleDateString();
                    newItem.end_date = newItem.end_date.toLocaleDateString();
                    return newItem;
                })

                resData.tasks = newDataTask;

                res.json(resData);
            }

            if(access_lvl === 2){
                let resData = {};

                resData.teachers = [];

                let dataTeachers = await sequelize.query(`SELECT teacher_id, first_name, last_name, patronymic FROM teachers`, { type: QueryTypes.SELECT });

                resData.teachers = [...dataTeachers];

                resData.subjects = [];

                let dataSubjects = await sequelize.query(`SELECT subjects.subject, teachers.teacher_id, teachers.first_name, teachers.last_name, teachers.patronymic FROM subjects JOIN teachers ON subjects.subject_id = teachers.subject_id WHERE teachers.user_id = ${userId}`, { type: QueryTypes.SELECT }); 
                
                let newDataSubjects = [];
                let iter = -1;
                let setSubkectName = new Set();
                dataSubjects.forEach(item => {
                    if(!setSubkectName.has(item.subject)){
                        iter++;
                        setSubkectName.add(item.subject);
                        let newItem = {...item};
                        newItem.teacher_id = [item.teacher_id];
                        newItem.teachers = `${item.first_name} ${item.last_name[0]}.${item.patronymic[0]}.`
                        newDataSubjects[iter] = newItem;
                    } else {
                        let newItem = {...newDataSubjects[iter]};
                        newItem.teacher_id.push(item.teacher_id);
                        newItem.teachers = newItem.teachers+`, ${item.first_name} ${item.last_name[0]}.${item.patronymic[0]}.`
                        newDataSubjects[iter] = newItem;
                    }
                });

                console.log(newDataSubjects);

                resData.subjects = [...newDataSubjects];

                
                
                let dataTask = await sequelize.query(`SELECT tasks.task_id, tasks.task, tasks.task_type_id, tasks.theme_id, tasks.date, tasks.end_date, tasks.description, tasks.link, themes.theme, subjects.subject, task_types.task_type FROM tasks JOIN subjects JOIN themes JOIN task_types ON tasks.subject_id = subjects.subject_id AND tasks.theme_id = themes.theme_id AND tasks.task_type_id = task_types.task_type_id`, { type: QueryTypes.SELECT });

                let newDataTask = dataTask.map(item => {
                    let newItem = {...item};
                    newItem.date = newItem.date.toLocaleDateString();
                    newItem.end_date = newItem.end_date.toLocaleDateString();
                    return newItem;
                })

                resData.tasks = newDataTask;

                res.json(resData);
            }
        }
        catch(e){
            res.status(500).json({message: 'ЧТо-то пошло не так subj, попробуйте снова'})
        }
    }
);


module.exports = router;