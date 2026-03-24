describe("test setup", () => {
  it("loads test environment variables", () => {
    expect(process.env.NEXTAUTH_SECRET).toBe("test-secret");
    expect(process.env.NEXTAUTH_URL).toBe("http://localhost:3000");
  });
});
