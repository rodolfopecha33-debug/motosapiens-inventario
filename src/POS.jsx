import React,{useState} from 'react';
export default function POS(){
const [cart,setCart]=useState([]);
const products=[{n:'ACEITE MOBIL',p:35000},{n:'FILTRO FZ',p:28000},{n:'PASTILLAS P180',p:45000}];
const add=(x)=>setCart([...cart,x]);
const total=cart.reduce((a,b)=>a+b.p,0);
return <div className='pos'><div className='left'><h1>POS PRO</h1>{products.map((x,i)=><button key={i} onClick={()=>add(x)}>{x.n} - ${x.p}</button>)}</div><div className='right'><h2>Carrito</h2>{cart.map((x,i)=><div key={i}>{x.n} ${x.p}</div>)}<h3>Total ${total}</h3><button>Cobrar</button></div></div>
}
