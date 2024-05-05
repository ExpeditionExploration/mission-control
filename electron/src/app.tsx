import { Button } from '@carbon/react';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.body);
root.render(
    <h2>
        Hello from React!
        <Button
            onClick={() => {
                console.log('Button clicked!');
            }}
        >
            Connect
        </Button>
    </h2>
);
