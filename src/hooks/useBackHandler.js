import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * Custom hook to register a back-action for the mobile phone undo/back button.
 * 
 * @param {string} id Unique identifier for this back handler
 * @param {boolean} isActive Whether the modal/drawer/view is currently active
 * @param {Function} handler Callback to close or revert the state
 * @param {number} priority Priority of execution (higher executes first)
 */
export const useBackHandler = (id, isActive, handler, priority = 10) => {
    const { registerBackHandler, unregisterBackHandler } = useAppContext();

    useEffect(() => {
        if (isActive && handler) {
            registerBackHandler(id, handler, priority);
            return () => {
                unregisterBackHandler(id);
            };
        } else {
            unregisterBackHandler(id);
        }
    }, [id, isActive, handler, priority, registerBackHandler, unregisterBackHandler]);
};

export default useBackHandler;
