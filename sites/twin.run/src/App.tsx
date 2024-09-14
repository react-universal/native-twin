import './editor/monaco';
import ReactDOM from 'react-dom/client';
import twinConfig from '../tailwind.config';
import { install } from '@native-twin/core';
import { TwinEditor } from './react/Editor';

install(twinConfig);

export default function App() {
  return (
    <div className='flex flex-1 flex-col bg-black'>
      <TwinEditor />
    </div>
  );
}
const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement!).render(<App />);
