import React from 'react';
import Text from '@commercetools-uikit/text';
import { STYLES } from '../constants';

export const PaginationControls = () => {
  return (
    <div style={STYLES.pagination.container}>
      <div>
        <select 
          style={STYLES.pagination.select}
          defaultValue="20"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <Text.Detail style={STYLES.pagination.label}>Items per page (5 items)</Text.Detail>
      </div>
      
      <div>
        <button 
          style={STYLES.pagination.button}
          disabled
        >
          &lt;
        </button>
        <Text.Detail style={STYLES.pagination.text}>Page</Text.Detail>
        <input 
          type="text" 
          value="1" 
          readOnly
          style={STYLES.pagination.input}
        />
        <Text.Detail style={STYLES.pagination.text}>of 1</Text.Detail>
        <button 
          style={{
            ...STYLES.pagination.button,
            marginLeft: '8px',
            marginRight: 0
          }}
          disabled
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

PaginationControls.displayName = 'PaginationControls'; 