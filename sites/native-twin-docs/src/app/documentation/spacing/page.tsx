import { ClassToRenderer } from '@/feactures/docs/layout/ClassToRederer';
import { HeaderDocsTop } from '@/feactures/docs/layout/HeaderDocsTop';
import tailwindClasses from '../../../../data';
import { gapData, paddingData } from './dataSpacing';

export default function SpacingPage() {
  return (
    <div className='flex flex-col gap-10'>
      <HeaderDocsTop
        title='Padding and Margin'
        id='paddingMargin'
        Data={tailwindClasses.spacing.paddingMargin}
      ></HeaderDocsTop>
      <ClassToRenderer list={paddingData}></ClassToRenderer>
      <HeaderDocsTop
        title='Gap'
        id='gap'
        Data={tailwindClasses.spacing.gap}
      ></HeaderDocsTop>
      <ClassToRenderer list={gapData}></ClassToRenderer>
    </div>
  );
}
