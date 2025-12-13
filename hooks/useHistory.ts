
import { useState, useCallback } from 'react';

export interface HistoryItem<T> {
  state: T;
  name: string;
  timestamp: number;
}

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<{
    past: HistoryItem<T>[];
    present: T;
    future: HistoryItem<T>[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newState: T | ((curr: T) => T), actionName: string = 'Update') => {
    setHistory(curr => {
      const nextState = typeof newState === 'function' ? (newState as any)(curr.present) : newState;
      if (nextState === curr.present) return curr;

      return {
        past: [...curr.past, { state: curr.present, name: actionName, timestamp: Date.now() }],
        present: nextState,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(curr => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous.state,
        // The name here represents the action we are "undoing", enabling us to "Redo" it later
        future: [{ state: curr.present, name: previous.name, timestamp: Date.now() }, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(curr => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);

      return {
        past: [...curr.past, { state: curr.present, name: next.name, timestamp: Date.now() }],
        present: next.state,
        future: newFuture,
      };
    });
  }, []);
  
  const jumpTo = useCallback((index: number) => {
      setHistory(curr => {
          if (index < 0 || index >= curr.past.length) return curr;
          
          const target = curr.past[index];
          const newPast = curr.past.slice(0, index);
          
          // When jumping back, all intermediate states + current present become future (in reverse order for the stack)
          const intermediate = curr.past.slice(index + 1);
          const newFutureItems = [
              ...intermediate.map(i => ({ state: i.state, name: i.name, timestamp: i.timestamp })).reverse(), 
              { state: curr.present, name: target.name, timestamp: Date.now() }, // The state we left
              ...curr.future
          ];

          return {
              past: newPast,
              present: target.state,
              future: newFutureItems
          };
      });
  }, []);

  return { 
    state: history.present, 
    past: history.past, 
    future: history.future, 
    set, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    jumpTo 
  };
}
