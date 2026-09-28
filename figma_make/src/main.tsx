import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { localBoard } from '../../src/data/local-board'
import photos from '../../src/data/photo-manifest.json'
import puzzle from '../../src/data/puzzle-manifest.json'

const collections={gallery:photos.map((item,index)=>({id:`figma-photo-${index}`,asset_id:'fallback',title:item.title,caption:item.caption,alt_text:item.caption,location:'',year:item.year,sort_order:index,visible:true,src:item.src})),puzzle:puzzle.map((item,index)=>({id:`figma-puzzle-${index}`,asset_id:'fallback',title:item.title,alt_text:item.title,sort_order:index,visible:true,src:item.src}))}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App snapshot={localBoard} collections={collections}/>
  </React.StrictMode>,
)
