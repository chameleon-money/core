import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import type { LendingProtocol } from "../typechain-types/contracts/LendingProtocol";
import type { MockERC20 } from "../typechain-types/contracts/MockERC20";

describe("LendingProtocol", () => {
  let lendingProtocol: LendingProtocol;
  let mockToken: MockERC20;
  let secondToken: MockERC20; // Second token for borrow pairs
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  const BASIS_POINTS = 10000;

  beforeEach(async () => {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy the LendingProtocol
    const LendingProtocolFactory = await ethers.getContractFactory(
      "LendingProtocol"
    );
    lendingProtocol = await LendingProtocolFactory.deploy();
    await lendingProtocol.waitForDeployment();

    // Deploy a mock ERC20 token for testing
    const MockTokenFactory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockTokenFactory.deploy("Mock Token", "MTK");
    await mockToken.waitForDeployment();

    // Deploy a second token for borrow pairs
    secondToken = await MockTokenFactory.deploy("Second Token", "STK");
    await secondToken.waitForDeployment();

    // Mint some tokens to users
    const mintAmount = ethers.parseEther("1000");
    await mockToken.mint(await owner.getAddress(), mintAmount);
    await mockToken.mint(await user1.getAddress(), mintAmount);
    await mockToken.mint(await user2.getAddress(), mintAmount);

    await secondToken.mint(await owner.getAddress(), mintAmount);
    await secondToken.mint(await user1.getAddress(), mintAmount);
    await secondToken.mint(await user2.getAddress(), mintAmount);

    // Add the tokens as supported assets
    await lendingProtocol.addAsset(
      await mockToken.getAddress(),
      "Mock Share Token",
      "mMTK"
    );

    await lendingProtocol.addAsset(
      await secondToken.getAddress(),
      "Second Share Token",
      "sSTK"
    );

    // Add initial liquidity to the protocol
    const initialLiquidity = ethers.parseEther("500");
    await mockToken.approve(
      await lendingProtocol.getAddress(),
      initialLiquidity
    );
    await lendingProtocol.deposit(
      await mockToken.getAddress(),
      initialLiquidity
    );

    await secondToken.approve(
      await lendingProtocol.getAddress(),
      initialLiquidity
    );
    await lendingProtocol.deposit(
      await secondToken.getAddress(),
      initialLiquidity
    );
  });

  it("Should allow adding assets", async () => {
    // Get the address of the mock token
    const mockTokenAddress = await mockToken.getAddress();

    // Check the assets mapping
    const asset = await lendingProtocol.assets(mockTokenAddress);

    expect(asset.assetAddress).to.equal(mockTokenAddress);
    expect(asset.name).to.equal("Mock Share Token");
    expect(asset.symbol).to.equal("mMTK");
    expect(asset.isActive).to.be.true;

    // Check the supportedAssets array
    expect(await lendingProtocol.getSupportedAssetCount()).to.equal(2);
    expect(await lendingProtocol.supportedAssets(0)).to.equal(mockTokenAddress);
  });

  it("Should issue share tokens on deposit", async () => {
    // Get the mock token address
    const mockTokenAddress = await mockToken.getAddress();

    // Get the share token address
    const asset = await lendingProtocol.assets(mockTokenAddress);
    const shareTokenAddress = asset.shareTokenAddress;
    const shareToken = await ethers.getContractAt(
      "ShareToken",
      shareTokenAddress
    );

    // Approve the lending protocol to spend tokens
    const depositAmount = ethers.parseEther("100");
    await mockToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), depositAmount);

    // Make the deposit
    await lendingProtocol
      .connect(user1)
      .deposit(mockTokenAddress, depositAmount);

    // Check the share token balance
    const shareBalance = await shareToken.balanceOf(await user1.getAddress());

    // Since we know the contract is using the 1.5x multiplier for initial deposits
    // and we're using the formula shares = (amount * totalShares) / totalDeposited for subsequent deposits,
    // we expect 150 shares for 100 ETH deposit
    expect(shareBalance).to.equal(ethers.parseEther("150"));
  });

  it("Should calculate shares correctly for subsequent deposits", async () => {
    // Create a new token for a clean test
    const NewTokenFactory = await ethers.getContractFactory("MockERC20");
    const newToken = await NewTokenFactory.deploy("New Token", "NTK");
    await newToken.waitForDeployment();

    // Mint tokens
    const mintAmount = ethers.parseEther("1000");
    await newToken.mint(await user1.getAddress(), mintAmount);
    await newToken.mint(await user2.getAddress(), mintAmount);

    // Add as asset
    await lendingProtocol.addAsset(
      await newToken.getAddress(),
      "New Share Token",
      "nNTK"
    );

    const newTokenAddress = await newToken.getAddress();

    // Get the share token address
    const asset = await lendingProtocol.assets(newTokenAddress);
    const shareTokenAddress = asset.shareTokenAddress;
    const shareToken = await ethers.getContractAt(
      "ShareToken",
      shareTokenAddress
    );

    // First user deposits 100 tokens
    const firstDepositAmount = ethers.parseEther("100");
    await newToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), firstDepositAmount);
    await lendingProtocol
      .connect(user1)
      .deposit(newTokenAddress, firstDepositAmount);

    // Second user deposits 50 tokens
    const secondDepositAmount = ethers.parseEther("50");
    await newToken
      .connect(user2)
      .approve(await lendingProtocol.getAddress(), secondDepositAmount);
    await lendingProtocol
      .connect(user2)
      .deposit(newTokenAddress, secondDepositAmount);

    // Check the share token balances
    const user1Shares = await shareToken.balanceOf(await user1.getAddress());
    const user2Shares = await shareToken.balanceOf(await user2.getAddress());

    // First deposit: 100 tokens should get 150 shares (1.5 ratio for initial deposit)
    // Second deposit: 50 tokens should get 50 * 150 / 100 = 75 shares
    expect(user1Shares).to.equal(ethers.parseEther("150"));
    expect(user2Shares).to.equal(ethers.parseEther("75"));

    // Check total supply
    expect(await shareToken.totalSupply()).to.equal(ethers.parseEther("225"));
  });

  it("Should allow withdrawing assets by burning share tokens", async () => {
    // Create a new token for a clean test
    const NewTokenFactory = await ethers.getContractFactory("MockERC20");
    const newToken = await NewTokenFactory.deploy("New Token", "NTK");
    await newToken.waitForDeployment();

    // Mint tokens
    const mintAmount = ethers.parseEther("1000");
    await newToken.mint(await user1.getAddress(), mintAmount);

    // Add as asset
    await lendingProtocol.addAsset(
      await newToken.getAddress(),
      "New Share Token",
      "nNTK"
    );

    const newTokenAddress = await newToken.getAddress();

    // Get the share token address
    const asset = await lendingProtocol.assets(newTokenAddress);
    const shareTokenAddress = asset.shareTokenAddress;
    const shareToken = await ethers.getContractAt(
      "ShareToken",
      shareTokenAddress
    );

    // User1 deposits 100 tokens
    const depositAmount = ethers.parseEther("100");
    await newToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), depositAmount);
    await lendingProtocol
      .connect(user1)
      .deposit(newTokenAddress, depositAmount);

    // Get initial balances
    const initialTokenBalance = await newToken.balanceOf(
      await user1.getAddress()
    );
    const initialShareBalance = await shareToken.balanceOf(
      await user1.getAddress()
    );

    // Approve and withdraw half of the shares
    const withdrawShareAmount = ethers.parseEther("50");
    await shareToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), withdrawShareAmount);
    await lendingProtocol
      .connect(user1)
      .withdraw(newTokenAddress, withdrawShareAmount);

    // Check updated balances
    const finalTokenBalance = await newToken.balanceOf(
      await user1.getAddress()
    );
    const finalShareBalance = await shareToken.balanceOf(
      await user1.getAddress()
    );

    // Token balance should have increased by the withdrawal amount
    // Since we're now using a 1.5 ratio for initial deposit, withdrawing 50 shares should return 50/1.5 = 33.33 tokens
    const expectedTokenIncrease = ethers.parseEther("33.333333333333333333");
    expect(finalTokenBalance - initialTokenBalance).to.be.closeTo(
      expectedTokenIncrease,
      ethers.parseEther("0.001")
    );

    // Share balance should have decreased by 50
    expect(initialShareBalance - finalShareBalance).to.equal(
      ethers.parseEther("50")
    );

    // Check the total deposited amount
    const updatedAsset = await lendingProtocol.assets(newTokenAddress);
    // With 1.5x initial shares, withdrawing 50 shares should leave 66.666 tokens
    expect(updatedAsset.totalDeposited).to.be.closeTo(
      ethers.parseEther("66.666666666666666667"),
      ethers.parseEther("0.001")
    );
  });

  it("Should allow admin to add borrow pairs", async () => {
    const mockTokenAddress = await mockToken.getAddress();
    const secondTokenAddress = await secondToken.getAddress();

    // Set up a borrow pair
    const collateralRatio = 15000; // 150%
    const borrowAPR = 500; // 5%

    await lendingProtocol.addBorrowPair(
      mockTokenAddress,
      secondTokenAddress,
      collateralRatio,
      borrowAPR
    );

    // Check the borrow pair was added correctly
    const borrowPair = await lendingProtocol.borrowPairs(
      mockTokenAddress,
      secondTokenAddress
    );

    expect(borrowPair.collateralAsset).to.equal(mockTokenAddress);
    expect(borrowPair.borrowAsset).to.equal(secondTokenAddress);
    expect(borrowPair.collateralRatio).to.equal(collateralRatio);
    expect(borrowPair.borrowAPR).to.equal(borrowAPR);
    expect(borrowPair.isActive).to.be.true;

    // Check the borrow pairs count
    expect(await lendingProtocol.getBorrowPairsCount()).to.equal(1);
  });

  it("Should allow admin to update borrow pairs", async () => {
    const mockTokenAddress = await mockToken.getAddress();
    const secondTokenAddress = await secondToken.getAddress();

    // Set up a borrow pair
    const initialCollateralRatio = 15000; // 150%
    const initialBorrowAPR = 500; // 5%

    await lendingProtocol.addBorrowPair(
      mockTokenAddress,
      secondTokenAddress,
      initialCollateralRatio,
      initialBorrowAPR
    );

    // Update the borrow pair
    const newCollateralRatio = 20000; // 200%
    const newBorrowAPR = 1000; // 10%

    await lendingProtocol.updateBorrowPair(
      mockTokenAddress,
      secondTokenAddress,
      newCollateralRatio,
      newBorrowAPR
    );

    // Check the borrow pair was updated correctly
    const borrowPair = await lendingProtocol.borrowPairs(
      mockTokenAddress,
      secondTokenAddress
    );

    expect(borrowPair.collateralRatio).to.equal(newCollateralRatio);
    expect(borrowPair.borrowAPR).to.equal(newBorrowAPR);
  });

  it("Should allow users to borrow assets with sufficient collateral", async () => {
    const mockTokenAddress = await mockToken.getAddress();
    const secondTokenAddress = await secondToken.getAddress();

    // Set up a borrow pair
    const collateralRatio = 15000; // 150%
    const borrowAPR = 500; // 5%

    await lendingProtocol.addBorrowPair(
      mockTokenAddress,
      secondTokenAddress,
      collateralRatio,
      borrowAPR
    );

    // Prepare to borrow
    const collateralAmount = ethers.parseEther("150"); // 150 tokens
    const borrowAmount = ethers.parseEther("100"); // 100 tokens

    // Approve collateral transfer
    await mockToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), collateralAmount);

    // Get initial balances
    const initialCollateralBalance = await mockToken.balanceOf(
      await user1.getAddress()
    );
    const initialBorrowBalance = await secondToken.balanceOf(
      await user1.getAddress()
    );

    // Borrow
    await lendingProtocol
      .connect(user1)
      .borrow(
        mockTokenAddress,
        secondTokenAddress,
        collateralAmount,
        borrowAmount
      );

    // Check balances after borrowing
    const finalCollateralBalance = await mockToken.balanceOf(
      await user1.getAddress()
    );
    const finalBorrowBalance = await secondToken.balanceOf(
      await user1.getAddress()
    );

    // Collateral balance should have decreased
    expect(initialCollateralBalance - finalCollateralBalance).to.equal(
      collateralAmount
    );

    // Borrow balance should have increased
    expect(finalBorrowBalance - initialBorrowBalance).to.equal(borrowAmount);

    // Check loan details
    const loanDetails = await lendingProtocol.getLoanDetails(
      await user1.getAddress(),
      0
    );

    expect(loanDetails[0]).to.equal(mockTokenAddress); // collateralAsset
    expect(loanDetails[1]).to.equal(secondTokenAddress); // borrowAsset
    expect(loanDetails[2]).to.equal(collateralAmount); // collateralAmount
    expect(loanDetails[3]).to.equal(borrowAmount); // borrowedAmount
    expect(loanDetails[6]).to.be.true; // isActive

    // Check user loan count
    expect(
      await lendingProtocol.userLoanCount(await user1.getAddress())
    ).to.equal(1);
  });

  it("Should prevent borrowing with insufficient collateral", async () => {
    const mockTokenAddress = await mockToken.getAddress();
    const secondTokenAddress = await secondToken.getAddress();

    // Set up a borrow pair with 150% collateral ratio
    await lendingProtocol.addBorrowPair(
      mockTokenAddress,
      secondTokenAddress,
      15000, // 150%
      500 // 5%
    );

    // Try to borrow with insufficient collateral (100 collateral for 100 borrow with 150% requirement)
    const collateralAmount = ethers.parseEther("100");
    const borrowAmount = ethers.parseEther("100");

    await mockToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), collateralAmount);

    // This should fail because the required collateral is 150
    await expect(
      lendingProtocol
        .connect(user1)
        .borrow(
          mockTokenAddress,
          secondTokenAddress,
          collateralAmount,
          borrowAmount
        )
    ).to.be.revertedWith("Insufficient collateral");
  });

  it("Should allow users to repay loans with interest", async () => {
    const mockTokenAddress = await mockToken.getAddress();
    const secondTokenAddress = await secondToken.getAddress();

    // Set up a borrow pair
    const collateralRatio = 15000; // 150%
    const borrowAPR = 500; // 5%

    await lendingProtocol.addBorrowPair(
      mockTokenAddress,
      secondTokenAddress,
      collateralRatio,
      borrowAPR
    );

    // Borrow
    const collateralAmount = ethers.parseEther("150");
    const borrowAmount = ethers.parseEther("100");

    await mockToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), collateralAmount);

    await lendingProtocol
      .connect(user1)
      .borrow(
        mockTokenAddress,
        secondTokenAddress,
        collateralAmount,
        borrowAmount
      );

    // Get loan details to see the interest
    const loanDetails = await lendingProtocol.getLoanDetails(
      await user1.getAddress(),
      0
    );
    const interest = loanDetails[4]; // Interest amount
    const totalDue = borrowAmount + interest;

    // Approve repaying
    await secondToken
      .connect(user1)
      .approve(await lendingProtocol.getAddress(), totalDue);

    // Get initial balances before repaying
    const initialCollateralBalance = await mockToken.balanceOf(
      await user1.getAddress()
    );
    const initialBorrowAssetBalance = await secondToken.balanceOf(
      await user1.getAddress()
    );

    // Repay the loan
    await lendingProtocol.connect(user1).repay(0, totalDue);

    // Check balances after repaying
    const finalCollateralBalance = await mockToken.balanceOf(
      await user1.getAddress()
    );
    const finalBorrowAssetBalance = await secondToken.balanceOf(
      await user1.getAddress()
    );

    // Collateral balance should have increased
    expect(finalCollateralBalance - initialCollateralBalance).to.equal(
      collateralAmount
    );

    // Borrow asset balance should have decreased by the repaid amount
    expect(initialBorrowAssetBalance - finalBorrowAssetBalance).to.be.closeTo(
      totalDue,
      ethers.parseEther("0.001") // Allow small difference due to rounding
    );

    // Check loan status
    const updatedLoanDetails = await lendingProtocol.getLoanDetails(
      await user1.getAddress(),
      0
    );
    expect(updatedLoanDetails[6]).to.be.false; // isActive should be false
  });
});
