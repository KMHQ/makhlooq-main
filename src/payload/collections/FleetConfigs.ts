import { CollectionConfig } from 'payload';
import { revalidatePathHook } from '../hooks/revalidate';

export const FleetConfigs: CollectionConfig = {
  slug: 'fleet_configs',
  labels: {
    singular: 'Fleet Config',
    plural: 'Fleet Configs',
  },
  admin: {
    useAsTitle: 'display_name',
    defaultColumns: ['display_name', 'slug', 'fleet_type', 'enabled'],
    group: 'Fleet',
  },
  hooks: {
    afterChange: [revalidatePathHook("/fleet")],
    afterDelete: [revalidatePathHook("/fleet")],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      label: 'FleetYards Slug',
    },
    {
      name: 'display_name',
      type: 'text',
      required: true,
      label: 'Display Name',
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enabled',
    },
    {
      name: 'sort_order',
      type: 'number',
      label: 'Sort Order',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'fleet_type',
      type: 'select',
      label: 'Fleet Type',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Sub-Capital', value: 'sub_capital' },
        { label: 'Capital', value: 'capital' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'ceo_name',
      type: 'text',
      label: 'CEO Name',
    },
    {
      name: 'ceo_discord_uid',
      type: 'text',
      label: 'CEO Discord UID',
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity (if overriding)',
      defaultValue: 1,
    },
  ],
};
