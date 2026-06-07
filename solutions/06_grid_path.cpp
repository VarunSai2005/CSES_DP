#include <bits/stdc++.h>
using namespace std;
const int mod = 1000000007;

int main() {

    int n;
    cin>>n;

    std::vector<string> a(n);
    for(int i=0; i<n; i++) cin>>a[i];

    std::vector<vector<long long>> dp(n+1, vector<long long>(n+1, 0));
    if(a[0][0] == '.') dp[1][1] = 1;

    for(int i=1; i<=n; i++){
        for(int j=1; j<=n; j++){
            if (i == 1 && j == 1) continue;
            if(a[i-1][j-1] == '*') continue;
            dp[i][j] = (dp[i-1][j]+dp[i][j-1])%mod;
        }
    }
    cout<<dp[n][n];
}