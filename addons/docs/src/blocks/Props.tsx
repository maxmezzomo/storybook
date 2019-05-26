import React from 'react';
import { PropsTable, PropsTableError, PropsTableProps, PropDef } from '@storybook/components';
import { DocsContext, DocsContextProps } from './DocsContext';
import { getPropDefs as autoPropDefs, PropDefGetter } from '../lib/getPropDefs';

interface PropsProps {
  exclude?: string[];
  of?: any;
}

const inferPropDefs = (framework: string): PropDefGetter | null => {
  switch (framework) {
    case 'react':
    case 'vue':
      return autoPropDefs;
    default:
      return null;
  }
};

export const getPropsTableProps = (
  { exclude, of }: PropsProps,
  { parameters }: DocsContextProps
): PropsTableProps => {
  const { component } = parameters;
  try {
    const target = of || component;
    if (!target) {
      throw new Error(PropsTableError.NO_COMPONENT);
    }

    const { framework = null } = parameters || {};
    const { getPropDefs = inferPropDefs(framework) } =
      (parameters && parameters.options && parameters.options.docs) || {};

    if (!getPropDefs) {
      throw new Error(PropsTableError.PROPS_UNSUPPORTED);
    }
    const allRows = getPropDefs(target);
    const rows = !exclude ? allRows : allRows.filter((row: PropDef) => !exclude.includes(row.name));
    return { rows };
  } catch (err) {
    return { error: err.message };
  }
};

const PropsContainer: React.FunctionComponent<PropsProps> = props => (
  <DocsContext.Consumer>
    {context => {
      const propsTableProps = getPropsTableProps(props, context);
      return <PropsTable {...propsTableProps} />;
    }}
  </DocsContext.Consumer>
);

export { PropsContainer as Props };
