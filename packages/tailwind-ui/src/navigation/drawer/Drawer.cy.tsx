import { H1 } from '@universal-labs/primitives';
import '../../../cypress/styles/globals.css';
import { Drawer } from './Drawer';

describe('<Drawer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    let isOpen = true;
    cy.mount(
      <Drawer
        drawerWidth={400}
        isOpen={isOpen}
        onToggle={() => {
          isOpen = !isOpen;
        }}
        className='bg-gray-800'
      >
        <H1>asd</H1>
      </Drawer>,
    );
  });
});
