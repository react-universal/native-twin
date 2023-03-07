import { H1 } from '@universal-labs/primitives';
import { Drawer } from './Drawer';

describe('<Drawer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Drawer drawerWidth={400} isOpen onToggle={() => null}>
        <H1>asd</H1>
      </Drawer>,
    );
  });
});
