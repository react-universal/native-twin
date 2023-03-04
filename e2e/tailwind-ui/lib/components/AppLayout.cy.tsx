import React from 'react';
import { Span } from '@react-universal/primitives';
import { AppLayout } from './AppLayout';

describe('<AppLayout />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <AppLayout>
        <Span>asd</Span>
      </AppLayout>,
    );
  });
});
