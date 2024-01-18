import {
  GelatoRelay,
  TransactionStatusResponse,
} from '@gelatonetwork/relay-sdk'

export async function awaitGelatoTask(
  taskId: string,
): Promise<TransactionStatusResponse | null> {
  const relay = new GelatoRelay()
  return await new Promise((resolve, reject) => {
    const maxRetry = 100
    let retryNum = 0
    const interval = setInterval(async () => {
      retryNum++
      if (retryNum > maxRetry) {
        clearInterval(interval)
        reject('Max retry reached')
      }
      const taskStatus = await relay.getTaskStatus(taskId)
      console.log('Gelato task status:', taskStatus)
      if (taskStatus?.taskState == 'ExecSuccess') {
        clearInterval(interval)
        resolve(taskStatus)
      }
    }, 500)
  })
}
