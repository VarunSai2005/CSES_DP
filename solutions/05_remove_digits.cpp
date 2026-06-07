#include <bits/stdc++.h>
using namespace std;
 
int findMax(int n) {
    int mx = 0;
    while (n!=0) {
        mx = max(mx, n%10);
        n/=10;
    }
    return mx;
}
 
int main() {
    int n;
    cin >> n;
 
    vector<int> dp(n + 1, 0);
    for (int i=1; i<=n; i++) {
        int mx = findMax(i);
        dp[i] = dp[i - mx] + 1;
    }
    cout<<dp[n];
    return 0;
}