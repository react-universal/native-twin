import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Uses Tailwind',
    Svg: require('@site/static/img/tailwind-css-logo.svg').default,
    description: <>Use Tailwind classes to style an React Native applications.</>,
  },
  {
    title: 'Blazingly Fast',
    Svg: require('@site/static/img/high-voltage.svg').default,
    description: (
      <>
        Enjoy fast compilation times by using Vite. Save time and increase productivity in your
        development.
      </>
    ),
  },
  {
    title: 'Lightweight',
    Svg: require('@site/static/img/pinching-hand.svg').default,
    description: (
      <>
        We parse only the classnames used in your project, with no unnecessary elements that
        slow down your application.
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} role='img' />
      </div>
      <div className='text--center padding-horiz--md'>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
