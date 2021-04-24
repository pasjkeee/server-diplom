const Sequelize = require('sequelize')
const sequelize = require('../utils/database');

const User = sequelize.define('users', {
    user_id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    access_lvl: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
});

const Teacher = sequelize.define('teacher', {
    teacher_id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    first_name: {
        type: Sequelize.STRING,
    },
    last_name: {
        type: Sequelize.STRING,
    },
    patronymic: {
        type: Sequelize.STRING,
    }
});

User.hasOne(Teacher, {foreignKey: 'user_id', sourceKey: 'user_id'});



const User_group = sequelize.define('user_group', {
    user_group_id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    user_group: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

User_group.hasMany(User, {foreignKey: 'user_group_id', sourceKey: 'user_group_id'});

const Subject = sequelize.define('subject', {
    subject_id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    subject: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

Subject.hasMany(Teacher, {foreignKey: 'subject_id', sourceKey: 'subject_id'});

const Task = sequelize.define('task', {
    task_id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    task: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    end_date: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
    },
    link: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    theme_id: {
        allowNull: false,
        type: Sequelize.INTEGER
    }
});

Subject.hasMany(Task, {foreignKey: 'subject_id', sourceKey: 'subject_id'});

const Task_type = sequelize.define('task_type', {
    task_type_id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    task_type: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

Task_type.hasMany(Task, {foreignKey: 'task_type_id', sourceKey: 'task_type_id'});

const Event = sequelize.define("event", {
    
});

Task.belongsToMany(User, {through: 'event', foreignKey: 'task_id'});
User.belongsToMany(Task, {through: 'event', foreignKey: 'user_id'});
Teacher.hasMany(Event, {foreignKey: 'teacher_id', sourceKey: 'teacher_id'});
User_group.hasMany(Event, {foreignKey: 'user_group_id', sourceKey: 'user_group_id'});


const Theme = sequelize.define('theme', {
    theme_id:{
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    theme:{
        type: Sequelize.STRING,
        allowNull: false,
    }
});

Theme.hasMany(Task, {foreignKey: 'theme_id', sourceKey: 'theme_id'});



module.exports = {User, Teacher, User_group, Subject, Event, Task_type, Task}
