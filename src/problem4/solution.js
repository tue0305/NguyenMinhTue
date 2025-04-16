/**
 * Implementation A: Using a loop
 * Time complexity: O(n)
 * Space complexity: O(1)
 */
var sum_to_n_a = function(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * Implementation B: Using mathematical formula
 * Sum of first n natural numbers = n * (n + 1) / 2
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
var sum_to_n_b = function(n) {
  return n * (n + 1) / 2;
};

/**
 * Implementation C: Using recursion
 * Time complexity: O(n)
 * Space complexity: O(n) due to call stack
 */
var sum_to_n_c = function(n) {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
};