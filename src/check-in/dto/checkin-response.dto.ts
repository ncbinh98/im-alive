export class CheckInResponseDto {
  id: string;

  userId: string;

  checkedInAt: Date;

  notes?: string;

  message: string;
}
