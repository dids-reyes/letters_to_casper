import React from 'react';

const DEFAULT_BANNER_DOC = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:transparent;overflow:hidden;display:flex;justify-content:center;align-items:center}</style></head><body>
<script type="text/javascript">
  atOptions = {
    'key': 'b11441d81ff752287d8998911e381515',
    'format': 'iframe',
    'height': 250,
    'width': 300,
    'params': {}
  };
</script>
<script type="text/javascript" src="https://www.highrevenueformat.com/b11441d81ff752287d8998911e381515/invoke.js"></script>
</body></html>`;

export default function AdsterraBanner({
  width = 300,
  height = 250,
  adKey = 'b11441d81ff752287d8998911e381515',
  className = '',
}) {
  const isDefault = width === 300 && height === 250 && adKey === 'b11441d81ff752287d8998911e381515';
  const srcDoc = isDefault
    ? DEFAULT_BANNER_DOC
    : `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;width:100%;height:100%;background:transparent;overflow:hidden;display:flex;justify-content:center;align-items:center}</style></head><body>
<script type="text/javascript">
  atOptions = {
    'key': '${adKey}',
    'format': 'iframe',
    'height': ${height},
    'width': ${width},
    'params': {}
  };
</script>
<script type="text/javascript" src="https://www.highrevenueformat.com/${adKey}/invoke.js"></script>
</body></html>`;

  return (
    <iframe
      className={className}
      title="Advertisement from Adsterra"
      srcDoc={srcDoc}
      width={width}
      height={height}
      scrolling="no"
      style={{
        display: 'block',
        border: 0,
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        overflow: 'hidden',
        margin: '0 auto',
      }}
    />
  );
}

