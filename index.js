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
const auth = new Map();
io.on('connection', async (s) => {
    let handshake = s.handshake;
    let uuid = !s.secure && setTimeout( 
        ()=>{
            if( !Object.keys(handshake.auth).length ) {
                console.log(handshake.auth);
                s.emit('m','no ticket')
                s.disconnect(1,'no ticket');
            }
        },
        300, 
    );
    s.use((e,n)=>{
        n();
    });
    s.on('disconnecting',(r)=>{
        // remove id from set
        clearTimeout(uuid);
        let id = auth.get(s.id);
        if(id) auth.delete(id) && auth.delete(s.id);
    });
    s.on('j',(name='general')=>{
        socketConnect(s,name);
    })
    s.on('t', (args)=>{
        let id;
        s.emit('t', id =io.engine.generateId() );
        auth.set(id,s.id);
        auth.set(s.id,id);
    });
})
app.use('/reload', (q,r)=> r.send(io.emit('r')) )
app.get('/:id',(q,r,n)=>{
    r.sendFile(path.join(__dirname,'./index.html'),{headers:{link:'<style.css>;rel=stylesheet'}});
})
server.listen(port,()=> console.log(`Rocking on ${port}`))
