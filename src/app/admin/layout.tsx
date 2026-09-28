import type { ReactNode } from 'react';
import StudioProvider from '../../components/studio/StudioProvider';
import './studio.css';
export const metadata={title:'Andre Archive Studio',robots:{index:false,follow:false}};
export default function Layout({children}:{children:ReactNode}){return <StudioProvider>{children}</StudioProvider>}
