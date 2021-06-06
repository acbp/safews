const socket = io();
const toDate = d => new Date(parseInt(d)).toLocaleTimeString(navigator.language,{hour12:false});
socket.emit('j',location.pathname.slice(1));
socket.on('m', m => {
    let now = m.match(/(?<=\()(\d+)/g) 
    now = now && toDate(now[0])||'$1';
    const withDate = m.replace(/(?<=\()(\d+)/g,now);
    const user = withDate.substr(0, 21);
    const msg = withDate.substr(21);
    let df = document.createDocumentFragment();
    let t = document.createTextNode(msg);
    let u = document.createTextNode(user);
    let p  = document.createElement('p');
    let sp1  = document.createElement('span');
    let sp2  = document.createElement('span');
    df.appendChild(p)
    sp1.appendChild(u)
    p.appendChild(sp1)
    msg && sp2.appendChild(t) && p.appendChild(sp2)
    const ul = document.body.querySelector('ul')
    ul.insertBefore(p,ul.children[0]);
})

socket.on('r',()=> location.reload() )

const btn = document.querySelector('.fixed :nth-child(2)');
const msg = document.querySelector('.fixed :nth-child(1)');

btn.onclick = e => {
    e.preventDefault();
    socket.emit('m',msg.value);
    msg.value = '';
    msg.focus();
};

window.onfocus = ()=> msg.focus();
