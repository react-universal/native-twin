import { H1 } from '@react-universal/primitives';
import { Drawer } from '@react-universal/tailwind-ui';

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
