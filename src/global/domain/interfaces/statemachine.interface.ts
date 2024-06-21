/**
 * StateMachine interface
 * @param T - Entity type
 * @param K - State type
 */
export interface StateMachine<T, K> {
  getCurrentState(entity: T): K;

  /**
   * Transition to a new state
   * @param entity
   * @param newState
   * @returns void
   * @throws StateMachineException
   */
  transition(entity: T, newState: K): void;
}
