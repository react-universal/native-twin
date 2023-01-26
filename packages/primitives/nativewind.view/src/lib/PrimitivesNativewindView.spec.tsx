import { render } from '@testing-library/react';

import PrimitivesNativewindView from './PrimitivesNativewindView';

describe('PrimitivesNativewindView', () => {
  
  it('should render successfully', () => {
    const { baseElement } = render(<PrimitivesNativewindView />);
    expect(baseElement).toBeTruthy();
  });
  
});
