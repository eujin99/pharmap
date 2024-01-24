//index.js
const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql");
const saltRounds = 10;
const util = require('util');



const port = process.env.PORT || 4000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "qwerqwerqwerqwerqwer",
    resave: true,
    saveUninitialized: true
}));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "pharmap"
});

const queryAsync = util.promisify(db.query).bind(db);

db.connect((err) => {
    if (err) {
        console.error('MySQL 연결 에러:', err);
        throw err;
    }
    console.log('MySQL에 연결되었습니다.');
});

const http = require('http').createServer(app);

// 회원가입
app.post("/register", async (req, res) => {
    const { username, password, is_pharmacist } = req.body;

    // 비밀번호가 제공되었는지 확인
    if (!password) {
        return res.status(400).send("비밀번호가 필요합니다");
    }

    try {
        // 솔트 생성
        const salt = await bcrypt.genSalt(saltRounds);

        // 생성된 솔트로 비밀번호 해싱
        const hashedPassword = bcrypt.hashSync(password, salt);


        const newUser = {
            username,
            password: hashedPassword,
            is_pharmacist: is_pharmacist === "on" ? true : false,
        };

        db.query("INSERT INTO users SET ?", newUser, (err, result) => {
            if (err) throw err;
            console.log("사용자 등록됨:", result);
            res.redirect("/login");
        });
    } catch (error) {
        console.error("등록 중 오류 발생:", error);
        res.status(500).send("내부 서버 오류");
    }
});


// 로그인
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const match = await bcrypt.compare(password, result[0].password);

            if (match) {
                req.session.user = result[0];
                res.redirect("/index.html"); // 로그인 후 이동할 페이지
            } else {
                res.send("Incorrect password");
            }
        } else {
            res.send("User not found");
        }
    });
});

// 클라이언트에게 사용자 정보 전달
app.get('/get-user-info', (req, res) => {
    const user = req.session.user;

    if (user) {
        res.json({
            username: user.username,
            userType: user.is_pharmacist ? 'pharmacist' : 'user', // 사용자 유형 전달
        });
    } else {
        res.status(401).json({
            error: '사용자 정보를 찾을 수 없습니다.',
        });
    }
});



// 로그아웃
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// 로그아웃 함수
app.post("/logout", (req, res) => {
    // 세션을 해제하거나 필요한 로그아웃 처리를 수행
    req.session.destroy((err) => {
        if (err) {
            console.error('세션 해제에 실패했습니다.', err);
            res.status(500).send('Internal Server Error');
        } else {
            // 로그아웃 성공 시 응답
            res.status(200).send('로그아웃 성공');
        }
    });
});

//////////자유게시판//////////
// 필요한 패키지 및 MySQL 연결 설정

// Express 설정
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 글 작성
app.post("/posts", async (req, res) => {
    const { username, content } = req.body;

    try {
        // 로그인 여부 확인
        const userInfoResponse = await fetchUserInfo(req);
        if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();

            // 약사만 글 작성 가능
            if (userInfo.userType === 'pharmacist') {
                db.query('INSERT INTO posts (username, content) VALUES (?, ?)', [username, content], (err, result) => {
                    if (err) throw err;
                    res.send('게시글이 작성되었습니다.');
                });
            } else {
                console.error('약사만 글을 작성할 수 있습니다.');
                res.status(403).json({ message: '약사만 글을 작성할 수 있습니다.' });
            }
        } else {
            console.error('로그인이 필요합니다.');
            res.status(401).json({ message: '로그인이 필요합니다.' });
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        res.status(500).json({ message: '글 작성 중 에러 발생' });
    }
});

// 글 목록을 가져와서 표시하는 함수
app.get('/posts', async (req, res) => {
    try {
        // 로그인 여부 확인
        const userInfoResponse = await fetchUserInfo(req);
        if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();

            db.query('SELECT * FROM posts', (err, result) => {
                if (err) throw err;

                // 글 목록을 순회하며 리스트 아이템을 생성합니다.
                const filteredPosts = result.filter(post => userInfo.userType === 'pharmacist' || post.username === userInfo.username);
                res.json(filteredPosts);
            });
        } else {
            console.error('로그인이 필요합니다.');
            res.status(401).json({ message: '로그인이 필요합니다.' });
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        res.status(500).json({ message: '글 목록을 가져오는 중 에러 발생' });
    }
});

// 클라이언트로부터 사용자 정보 가져오기
async function fetchUserInfo(req) {
    const response = await axios.get(`${req.protocol}://${req.get('host')}/get-user-info`);
    return response;
}







/////////////////////////////////////////////////////////////////
const usedRandomIds = [];
const markerChatRooms = {}; // 새로운 맵을 추가하여 마커별 채팅방을 관리합니다.
const markerChatHistory = {};


app.use(express.static("public_html"));

const io = require('socket.io')(http);


io.on('connection', (socket) => {
    // 새로운 익명 번호 생성 및 할당
    const myAnonymousId = generateRandomId();

    socket.on('joinRoom', (markerId) => {
        // 기존에 참여한 방이 있는지 확인
        const existingRoomName = markerChatRooms[markerId];

        
        
        if (existingRoomName) {
            // 이전 채팅 내용이 있으면 클라이언트에게 전달하여 복원
            const previousChat = markerChatHistory[existingRoomName] || '';
            socket.emit('restoreChat', markerId, previousChat);

            // 새 방에 참여하기 전에 기존 방을 나갑니다.
            socket.leave(existingRoomName);
        }

        // 마커별로 고유한 방 이름을 생성
        const roomName = `marker_${markerId}`;
        socket.join(roomName);
        markerChatRooms[markerId] = roomName;

        io.to(roomName).emit('roomChanged', roomName, myAnonymousId);
    });

    // 클라이언트에 익명 번호 할당
    socket.emit('assignAnonymousId', myAnonymousId);


    socket.on('roomChanged', (roomName, senderAnonymousId) => {
        // 클라이언트에게 현재 채팅방 정보와 익명 번호를 전송
        socket.emit('assignAnonymousId', myAnonymousId);
        socket.to(roomName).emit('assignAnonymousId', senderAnonymousId);
    });

    socket.on('chatMessage', (markerId, message, senderAnonymousId, senderUserType) => {
        // 메시지를 보낸 클라이언트의 방에만 메시지를 전송
        io.to(`marker_${markerId}`).emit('message', message, senderAnonymousId, senderUserType);

        // 메시지를 기록하여 나중에 복원할 수 있도록 합니다.
        if (!markerChatHistory[markerId]) {
            markerChatHistory[markerId] = [];
        }
        markerChatHistory[markerId].push({ message, senderAnonymousId, senderUserType });
    });

    socket.on('leaveRoom', (markerId) => {
        const roomName = markerChatRooms[markerId];
        if (roomName) {
            io.to(roomName).emit('leftRoom', markerId);
            delete markerChatRooms[markerId];

            // 익명 번호 반환 및 목록에서 제거
            releaseRandomId(myAnonymousId);
        }
    });
});

http.listen(port, () => {
    console.log('HTML 서버 시작됨');
});


// generateRandomId 함수 추가
function generateRandomId() {
    var randomId;
    do {
        randomId = Math.floor(1000 + Math.random() * 9000);
    } while (usedRandomIds.includes(randomId));
    usedRandomIds.push(randomId);
    return randomId;
}

// releaseRandomId 함수 추가
function releaseRandomId(randomId) {
    var index = usedRandomIds.indexOf(randomId);
    if (index !== -1) {
        usedRandomIds.splice(index, 1);
    }
}


app.get("/pharmach_list", (req, res) => {
    const api = async () => {
        let response = null;
        try {
            response = await axios.get(
                "http://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire",
                {
                    params: {
                        serviceKey:
                            "Ja5ZficjB7aCQlYrh/IfbgpG+e8wLGnfqY9aDHBQruOZxTr8Bj4LccaqHuPm7V9k+p+WLkaNLS1imJ3J8zxjSw==",
                        Q0: req.query.Q0,
                        Q1: req.query.Q1,
                        QT: req.query.QT,
                        QN: req.query.QN,
                        ORD: req.query.ORD,
                        pageNo: req.query.pageNo,
                        numOfRows: req.query.numOfRows,
                    },
                }
            );
        } catch (e) {
            console.log(e);
        }
        return response;
    };

    api().then((response) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(response.data.response.body);
    });
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public_html/register.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public_html/login.html');
});