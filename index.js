const path = require('path')
const express = require('express');
const http = require('http')
const https = require('https')
const socket = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socket(server)
const port = 3000;
const options = {
    extentions:['html','js','css'],
    setHeaders:(q,w,e)=>{
        q.set('link','<style.css>;rel=stylesheet;');
    }
};
app.use(express.static('./',options))
const rooms=new WeakSet();
class room{
    constructor(name,users=0){
        this.name=name;
        this.users=users;
    }
}
const general =  new room('general') 
rooms.add(general);
const socketConnect = (s,m) => { 
    const id = Date.now().toString(36);
    const room = m;
    s.join(room)
    s.emit('m', `Welcome user ${id} !`);
    s.broadcast.to(room).emit('m', `User ${id} has join us !`);
    s.on('m',(m)=>{
        io.to(room).emit('m',`${id} (${Date.now()}) :${m}`);
    }) 
    s.on('d', ()=> {
        io.to(room).emit('m',`User ${id} has left.`);
    })
};
io.on('connection', async (s) => {
    s.use((s,n)=>{
        n();
    });
    s.on('j',(name='general')=>{
        socketConnect(s,name);
    })
})
app.use('/reload', (q,r)=> r.send(io.emit('r')) )
app.get('/:id',(q,r,n)=>{
    r.sendFile(path.join(__dirname,'./index.html'),{headers:{link:'<style.css>;rel=stylesheet'}});
})
server.listen(port,()=> console.log(`Rocking on ${port}`))
