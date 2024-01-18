
# Zypher, Yet another instant messaging app

Zypher is a simple messaging application where you can find and talk to people you know, or random people you can find using the randomize feature (only people with showing up on randomize option enabled).

> [!NOTE]
> This app is not  intended to be used in production. It's nowhere finished yet. The only purpose of this app is to learn more about coding, programming languages and popular technologies. The code has too many potential security and privacy issues. It's not recommended to use it in production.

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
> You need to have a `redis`[^1] and `MongoDB`[^2] container installed and connected to start the backend.


[^1]: `redis-stack` is recommended for easier development
[^2]: Preferably with `MongoDB Atlas` for easier development

## Used technologies:

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