#include <bits/stdc++.h>
using namespace std;
const int MAX = INT_MAX;

int main() {
    int n, x;
    cin>>n>>x;
    vector<int> c(n);
    for (int i=0; i<n; i++) cin >> c[i];
    vector<int> dp(x+1, MAX);
    dp[0] = 0;

    for (int i=1; i<=x; i++) {
        for (int coin : c) {
            if (i>=coin && dp[i-coin] != MAX) {
                dp[i] = min(dp[i], dp[i-coin] + 1);
            }
        }
    }

    cout<<(dp[x] == MAX ? -1 :dp[x])<<"\n";
}
