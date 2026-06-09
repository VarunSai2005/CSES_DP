#include<bits/stdc++.h>
using namespace std;

int main(){
    int n, m;
    std::cin>>n>>m;
    std::vector<int> prices(n);
    std::vector<int> pages(n);
    for(int i=0; i<n; i++) std::cin >> prices[i];
    for(int i=0; i<n; i++) std::cin >> pages[i];

    std::vector<int> dp(m+1);

    for(int i=0; i<n; i++){
        for(int j=m; j>=prices[i]; j--){
            dp[j] = std::max(dp[j], dp[j-prices[i]]+pages[i]);
        }
    }

    std::cout<<dp[m];
    return 0;
}