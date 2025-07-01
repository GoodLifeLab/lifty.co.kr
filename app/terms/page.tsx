"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">이용약관</h1>
              <Link
                href="/signup"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                회원가입으로 돌아가기
              </Link>
            </div>

            <div className="prose prose-indigo max-w-none">
              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제1조 (목적)
              </h2>
              <p className="text-gray-600 mb-4">
                이 약관은 Lifty(이하 &ldquo;회사&ldquo;)가 제공하는 서비스의
                이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을
                규정함을 목적으로 합니다.
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제2조 (정의)
              </h2>
              <p className="text-gray-600 mb-4">
                1. &ldquo;서비스&ldquo;란 회사가 제공하는 모든 서비스를
                의미합니다.
                <br />
                2. &ldquo;회원&ldquo;이란 회사와 서비스 이용계약을 체결한 자를
                말합니다.
                <br />
                3. &ldquo;아이디&ldquo;란 회원의 식별과 서비스 이용을 위하여
                회원이 설정하고 회사가 승인한 문자와 숫자의 조합을 말합니다.
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제3조 (서비스의 제공)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회사는 회원에게 아래와 같은 서비스를 제공합니다.
                <br />
                - 리프트 서비스 예약 및 결제
                <br />
                - 회원 정보 관리
                <br />- 기타 회사가 정하는 서비스
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제4조 (서비스 이용시간)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다.
                <br />
                2. 회사는 시스템 정기점검, 증설 및 교체를 위해 서비스를 일시
                중단할 수 있으며, 예정된 작업으로 인한 서비스 일시 중단은 서비스
                내 공지사항을 통해 사전에 공지합니다.
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제5조 (회원가입)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회원가입은 회사가 정한 가입 양식에 따라 회원정보를 기입한 후
                이 약관에 동의하여 회원가입신청을 완료함으로써 이루어집니다.
                <br />
                2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승인을 하지 않을
                수 있습니다.
                <br />
                - 기술상 서비스 제공이 불가능한 경우
                <br />
                - 실명이 아니거나 타인의 명의를 이용한 경우
                <br />- 허위의 정보를 기재하거나 회사가 요구하는 내용을 기재하지
                않은 경우
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제6조 (개인정보보호)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기
                위해 노력합니다.
                <br />
                2. 개인정보의 보호 및 사용에 대해서는 관련법 및 회사의
                개인정보처리방침이 적용됩니다.
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제7조 (회사의 의무)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를
                하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로
                서비스를 제공하기 위하여 최선을 다하여야 합니다.
                <br />
                2. 회사는 회원이 안전하게 서비스를 이용할 수 있도록
                개인정보(신용정보 포함) 보호를 위한 보안시스템을 갖추어야
                합니다.
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제8조 (회원의 의무)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회원은 다음 행위를 하여서는 안 됩니다.
                <br />
                - 신청 또는 변경 시 허위내용의 등록
                <br />
                - 타인의 정보 도용
                <br />
                - 회사가 게시한 정보의 변경
                <br />
                - 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는
                게시
                <br />
                - 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해
                <br />- 회사와 기타 제3자의 명예를 손상시키거나 업무를 방해하는
                행위
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제9조 (약관의 변경)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회사는 약관의 규제에 관한 법률 등 관련법을 위배하지 않는
                범위에서 이 약관을 개정할 수 있습니다.
                <br />
                2. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여
                현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터
                적용일자 전일까지 공지합니다.
              </p>

              <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-4">
                제10조 (분쟁해결)
              </h2>
              <p className="text-gray-600 mb-4">
                1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그
                피해를 보상하기 위하여 고객상담 및 피해보상처리 기구를
                설치·운영합니다.
                <br />
                2. 회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그
                사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는
                이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                회원가입으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
