
# Zypher, Real Time Chat App.

This app is nowhere near finished. I'm still working on this project and learning a ton while developing.

## Scripts you can run:
To start the frontend:

```console
foo@bar:~$ cd ./client
foo@bar:~$ npm install
foo@bar:~$ npm start
```
To start the backend:

```console
foo@bar:~$ cd ./server
foo@bar:~$ npm install
foo@bar:~$ npm start
```

> [!IMPORTANT]
> You need to have a redis and mongodb container installed to start the backend.

## Tech used:
### Backend:

1. Express
2. Cors
3. Socket.io
4. jsonwebtokens
5. bcrypt
6. Mongoose/MongoDB
7. Redis

### Frontend:

1. React.js
2. socket.io-client
4. Tailwind.css
5. Flowbite
6. Bootstrap Icons
7. Axios

### TODOS:
- [x] Multi-language support
- [ ] Light mode
- [ ] Real-time updated conversations drawer
- [ ] Notification system
- [ ] Profile & Profile settings
- [ ] Privacy options (public/private profile / do not show up on random profile retriever etc.)