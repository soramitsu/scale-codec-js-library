@Library('jenkins-library') _

def pipeline = new org.js.LibPipeline(
    steps: this,
    packageManager: 'pnpm',
    testCmds: ['pnpm check-code-integrity'],
    pushCmds: ['pnpm publish:all'],
    buildDockerImage: 'build-tools/node:16-ubuntu-cypress',
    npmRegistries: [:],
    npmLoginEmail:'admin@soramitsu.co.jp')
pipeline.runPipeline()
