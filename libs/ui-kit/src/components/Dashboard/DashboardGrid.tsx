import React, { useState, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { styled } from '../../theme';

export interface DashboardGridProps {
  children: React.ReactNode;
  initialLayouts?: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
  isDraggable?: boolean;
  isResizable?: boolean;
}

const GridContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 400px;

  .react-grid-layout {
    position: relative;
    transition: height 200ms ease;
  }

  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
  }

  .react-grid-item.cssTransforms {
    transition-property: transform;
  }

  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }

  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }

  .react-grid-item.react-grid-placeholder {
    background: var(--brand-primary);
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }
`;

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  initialLayouts,
  onLayoutChange,
  isDraggable = true,
  isResizable = true,
}) => {
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => {
      // Rough estimation for window width minus sidebar
      setWidth(Math.max(window.innerWidth - 250, 800));
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const defaultLayouts = React.Children.map(children, (child, i) => ({
    i: i.toString(),
    x: (i * 6) % 12,
    y: Math.floor(i / 2) * 4,
    w: 6,
    h: 4,
    minW: 3,
    minH: 3,
  })) || [];

  return (
    <GridContainer>
      <GridLayout
        className="layout"
        layout={initialLayouts || defaultLayouts}
        cols={12}
        rowHeight={60}
        width={width}
        onLayoutChange={onLayoutChange}
        isDraggable={isDraggable}
        isResizable={isResizable}
        draggableHandle=".widget-drag-handle"
        margin={[16, 16]}
      >
        {React.Children.map(children, (child, i) => (
          <div key={i.toString()}>
            {child}
          </div>
        ))}
      </GridLayout>
    </GridContainer>
  );
};
