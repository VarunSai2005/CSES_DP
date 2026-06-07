#include <bits/stdc++.h>
using namespace std;
const int mod = 1e9 + 7;

int main() {
    int n, x;
    cin >> n >> x;
    vector<int> c(n);
    for (int i=0; i<n; i++) cin >> c[i];

    vector<long long> dp(x+1, 0);
    dp[0] = 1;

    for (int i=1; i<=x; i++) {
        for (int coin : c) {
            if (i >= coin) {
                dp[i] = (dp[i] + dp[i-coin]) % mod;
            }
        }
    }

    cout<<dp[x];
}
