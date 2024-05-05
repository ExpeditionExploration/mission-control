import '@carbon/styles/css/styles.min.css'
import ReactDOM from 'react-dom/client'
import { Window } from './Window'

function bootstrap() {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Window />)
}

bootstrap()
