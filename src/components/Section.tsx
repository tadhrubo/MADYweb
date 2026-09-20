import { ReactNode } from 'react'; import { WaveEdge } from './WaveEdge'
export function Section({children,bg,wave=true,className='' }:{children:ReactNode,bg:string,wave?:boolean,className?:string}){return <section className={`section ${className}`} style={{background:bg}}>{wave&&<WaveEdge fill={bg}/>}<div className="section-inner">{children}</div></section>}
